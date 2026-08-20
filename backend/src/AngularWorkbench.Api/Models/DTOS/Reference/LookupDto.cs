namespace AngularWorkbench.Api.Models.DTOS.Reference
{
    public sealed class LookupDto
    {
        public int LookupId { get; set; }
        public int Value { get; set; }

        public required string Name { get; set; }
        public required string Code { get; set; }

        public int SortOrder { get; set; }
    }
}
