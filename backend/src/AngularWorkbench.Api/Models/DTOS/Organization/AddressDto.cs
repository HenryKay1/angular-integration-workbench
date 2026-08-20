namespace AngularWorkbench.Api.Models.DTOS.Organization
{
    public sealed class AddressDto
    {
        public int AddressId { get; set; }

        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? PostalCode { get; set; }

        public int? CountryId { get; set; }
        public string? CountryName { get; set; }

        public int? StateId { get; set; }
        public string? StateName { get; set; }

        public int? CityId { get; set; }
        public string? CityName { get; set; }
    }
}
