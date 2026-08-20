namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class CompanyRequest
    {
        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsInternal { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
