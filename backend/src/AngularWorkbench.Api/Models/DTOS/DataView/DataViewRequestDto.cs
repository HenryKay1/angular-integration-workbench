using System.Text.Json;

namespace AngularWorkbench.Api.Models.DTOS.DataView
{
    public sealed class DataViewRequestDto
    {
        public string? SearchTerm { get; set; }
        public IReadOnlyList<string> SearchFields { get; set; } = [];
        public DataViewSortDto? Sort { get; set; }
        public IReadOnlyList<DataViewFilterDto> Filters { get; set; } = [];
        public string FilterLogic { get; set; } = "and";
        public DataViewPaginationDto? Pagination { get; set; }
    }


    public sealed class DataViewSortDto
    {
        public string FieldName { get; set; } = string.Empty;
        public string Direction { get; set; } = "asc";
    }
    public sealed class DataViewFilterDto
    {
        public string FieldName { get; set; } = string.Empty;
        public string Operator { get; set; } = string.Empty;
        public JsonElement? Value { get; set; }
    }
    public sealed class DataViewPaginationDto
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; } = 10;
    }
}
