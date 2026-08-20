namespace AngularWorkbench.Api.Models.DTOS.Organization
{
    public sealed class CompanyDto
    {
        public int CompanyId { get; set; }
        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsInternal { get; set; }
        public bool IsActive { get; set; }
    }
}
