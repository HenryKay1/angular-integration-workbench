using AngularWorkbench.Api.Models.DTOS.DataView;

namespace AngularWorkbench.Api.Services.DataView.Interfaces
{
    public interface IDataViewProcessor
    {
        Task<DataViewResultDto<TDto>> ProcessAsync<TDto>(
            IQueryable<TDto> query,
            DataViewRequestDto request,
            CancellationToken cancellationToken = default);
    }
}
