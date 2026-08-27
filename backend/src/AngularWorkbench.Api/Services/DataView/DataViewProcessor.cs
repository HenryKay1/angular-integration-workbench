using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;
using AngularWorkbench.Api.Models.DTOS.DataView;
using AngularWorkbench.Api.Services.DataView.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Services.DataView
{
    public sealed class DataViewProcessor : IDataViewProcessor
    {
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 100;

        public async Task<DataViewResultDto<TDto>> ProcessAsync<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(query);
            ArgumentNullException.ThrowIfNull(request);

            var processedQuery = ApplySearch(query, request);
            processedQuery = ApplyFilters(processedQuery, request);
            processedQuery = ApplySort(processedQuery, request);

            var totalCount = await processedQuery.CountAsync(cancellationToken);
            var pagedQuery = ApplyPagination(processedQuery, request);
            var items = await pagedQuery.ToListAsync(cancellationToken);

            return new DataViewResultDto<TDto>
            {
                Items = items,
                TotalCount = totalCount
            };
        }

        private static IQueryable<TDto> ApplySearch<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request)
        {
            if (
                string.IsNullOrWhiteSpace(request.SearchTerm) ||
                request.SearchFields.Count == 0)
            {
                return query;
            }

            var parameter = Expression.Parameter(typeof(TDto), "item");
            Expression? searchExpression = null;
            var searchTerm = Expression.Constant(request.SearchTerm.Trim());

            foreach (var fieldName in request.SearchFields)
            {
                var property = ResolveProperty<TDto>(fieldName);

                if (property.PropertyType != typeof(string))
                {
                    continue;
                }

                var propertyAccess = Expression.Property(parameter, property);
                var notNull = Expression.NotEqual(
                    propertyAccess,
                    Expression.Constant(null, typeof(string)));
                var contains = Expression.Call(
                    propertyAccess,
                    nameof(string.Contains),
                    Type.EmptyTypes,
                    searchTerm);
                var fieldExpression = Expression.AndAlso(notNull, contains);

                searchExpression = searchExpression is null
                    ? fieldExpression
                    : Expression.OrElse(searchExpression, fieldExpression);
            }

            if (searchExpression is null)
            {
                return query;
            }

            return query.Where(Expression.Lambda<Func<TDto, bool>>(
                searchExpression,
                parameter));
        }

        private static IQueryable<TDto> ApplyFilters<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request)
        {
            if (request.Filters.Count == 0)
            {
                return query;
            }

            var parameter = Expression.Parameter(typeof(TDto), "item");
            Expression? combinedExpression = null;
            var useOrLogic = string.Equals(
                request.FilterLogic,
                "or",
                StringComparison.OrdinalIgnoreCase);

            foreach (var filter in request.Filters)
            {
                var property = ResolveProperty<TDto>(filter.FieldName);
                var propertyAccess = Expression.Property(parameter, property);
                var filterExpression = BuildFilterExpression(
                    propertyAccess,
                    property.PropertyType,
                    filter);

                if (filterExpression is null)
                {
                    continue;
                }

                combinedExpression = combinedExpression is null
                    ? filterExpression
                    : useOrLogic
                        ? Expression.OrElse(combinedExpression, filterExpression)
                        : Expression.AndAlso(combinedExpression, filterExpression);
            }

            if (combinedExpression is null)
            {
                return query;
            }

            return query.Where(Expression.Lambda<Func<TDto, bool>>(
                combinedExpression,
                parameter));
        }

        private static IQueryable<TDto> ApplySort<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request)
        {
            if (request.Sort is null || string.IsNullOrWhiteSpace(request.Sort.FieldName))
            {
                return query;
            }

            var property = ResolveProperty<TDto>(request.Sort.FieldName);
            var parameter = Expression.Parameter(typeof(TDto), "item");
            var propertyAccess = Expression.Property(parameter, property);
            var keySelector = Expression.Lambda(propertyAccess, parameter);
            var methodName = string.Equals(
                request.Sort.Direction,
                "desc",
                StringComparison.OrdinalIgnoreCase)
                ? nameof(Queryable.OrderByDescending)
                : nameof(Queryable.OrderBy);
            var orderExpression = Expression.Call(
                typeof(Queryable),
                methodName,
                [typeof(TDto), property.PropertyType],
                query.Expression,
                Expression.Quote(keySelector));

            return query.Provider.CreateQuery<TDto>(orderExpression);
        }

        private static IQueryable<TDto> ApplyPagination<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request)
        {
            var pageIndex = Math.Max(request.Pagination?.PageIndex ?? 0, 0);
            var pageSize = Math.Clamp(
                request.Pagination?.PageSize ?? DefaultPageSize,
                1,
                MaxPageSize);

            return query
                .Skip(pageIndex * pageSize)
                .Take(pageSize);
        }

        private static Expression? BuildFilterExpression(
            MemberExpression propertyAccess,
            Type propertyType,
            DataViewFilterDto filter)
        {
            var targetType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;
            var convertedValue = ConvertJsonValue(filter.Value, targetType);

            if (convertedValue is null)
            {
                return null;
            }

            if (targetType == typeof(string))
            {
                return BuildStringFilterExpression(propertyAccess, filter.Operator, convertedValue);
            }

            if (targetType == typeof(bool) || IsComparableType(targetType))
            {
                var constant = Expression.Constant(convertedValue, targetType);
                Expression comparableProperty = propertyAccess.Type == targetType
                    ? propertyAccess
                    : Expression.Convert(propertyAccess, targetType);

                return BuildComparableFilterExpression(
                    comparableProperty,
                    filter.Operator,
                    constant);
            }

            return null;
        }

        private static Expression? BuildStringFilterExpression(
            MemberExpression propertyAccess,
            string filterOperator,
            object convertedValue)
        {
            var value = Expression.Constant(Convert.ToString(convertedValue) ?? string.Empty);
            var notNull = Expression.NotEqual(
                propertyAccess,
                Expression.Constant(null, typeof(string)));

            Expression? comparison = filterOperator switch
            {
                "equals" => Expression.Equal(propertyAccess, value),
                "notEquals" => Expression.NotEqual(propertyAccess, value),
                "contains" => Expression.Call(
                    propertyAccess,
                    nameof(string.Contains),
                    Type.EmptyTypes,
                    value),
                "startsWith" => Expression.Call(
                    propertyAccess,
                    nameof(string.StartsWith),
                    Type.EmptyTypes,
                    value),
                "endsWith" => Expression.Call(
                    propertyAccess,
                    nameof(string.EndsWith),
                    Type.EmptyTypes,
                    value),
                _ => null
            };

            return comparison is null
                ? null
                : Expression.AndAlso(notNull, comparison);
        }

        private static Expression? BuildComparableFilterExpression(
            Expression propertyAccess,
            string filterOperator,
            ConstantExpression value)
        {
            return filterOperator switch
            {
                "equals" => Expression.Equal(propertyAccess, value),
                "notEquals" => Expression.NotEqual(propertyAccess, value),
                "greaterThan" => Expression.GreaterThan(propertyAccess, value),
                "greaterThanOrEqual" => Expression.GreaterThanOrEqual(propertyAccess, value),
                "lessThan" => Expression.LessThan(propertyAccess, value),
                "lessThanOrEqual" => Expression.LessThanOrEqual(propertyAccess, value),
                _ => null
            };
        }

        private static PropertyInfo ResolveProperty<TDto>(string fieldName)
        {
            var property = typeof(TDto).GetProperties()
                .FirstOrDefault(item => string.Equals(
                    item.Name,
                    fieldName,
                    StringComparison.OrdinalIgnoreCase));

            if (property is null)
            {
                throw new InvalidOperationException(
                    $"DataView field '{fieldName}' does not exist on {typeof(TDto).Name}.");
            }

            return property;
        }

        private static object? ConvertJsonValue(
            JsonElement? value,
            Type targetType)
        {
            if (value is null || value.Value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
            {
                return null;
            }

            if (targetType == typeof(string))
            {
                return value.Value.GetString();
            }

            if (targetType == typeof(int))
            {
                return value.Value.ValueKind == JsonValueKind.Number
                    ? value.Value.GetInt32()
                    : int.Parse(value.Value.GetString() ?? string.Empty, CultureInfo.InvariantCulture);
            }

            if (targetType == typeof(long))
            {
                return value.Value.ValueKind == JsonValueKind.Number
                    ? value.Value.GetInt64()
                    : long.Parse(value.Value.GetString() ?? string.Empty, CultureInfo.InvariantCulture);
            }

            if (targetType == typeof(decimal))
            {
                return value.Value.ValueKind == JsonValueKind.Number
                    ? value.Value.GetDecimal()
                    : decimal.Parse(value.Value.GetString() ?? string.Empty, CultureInfo.InvariantCulture);
            }

            if (targetType == typeof(double))
            {
                return value.Value.ValueKind == JsonValueKind.Number
                    ? value.Value.GetDouble()
                    : double.Parse(value.Value.GetString() ?? string.Empty, CultureInfo.InvariantCulture);
            }

            if (targetType == typeof(bool))
            {
                return value.Value.ValueKind == JsonValueKind.True ||
                    (value.Value.ValueKind == JsonValueKind.String &&
                        bool.Parse(value.Value.GetString() ?? string.Empty));
            }

            if (targetType == typeof(DateTime))
            {
                return value.Value.ValueKind == JsonValueKind.String
                    ? DateTime.Parse(value.Value.GetString() ?? string.Empty, CultureInfo.InvariantCulture)
                    : value.Value.GetDateTime();
            }

            if (targetType.IsEnum)
            {
                return Enum.Parse(targetType, value.Value.GetString() ?? string.Empty, ignoreCase: true);
            }

            return Convert.ChangeType(
                value.Value.ToString(),
                targetType,
                CultureInfo.InvariantCulture);
        }

        private static bool IsComparableType(Type type)
        {
            return type == typeof(byte) ||
                type == typeof(short) ||
                type == typeof(int) ||
                type == typeof(long) ||
                type == typeof(float) ||
                type == typeof(double) ||
                type == typeof(decimal) ||
                type == typeof(DateTime);
        }
    }
}
