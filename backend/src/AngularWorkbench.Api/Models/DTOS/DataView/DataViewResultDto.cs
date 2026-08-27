namespace AngularWorkbench.Api.Models.DTOS.DataView
{
    public sealed class DataViewResultDto<TDto>
    {
        public IReadOnlyList<TDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
    }
}
