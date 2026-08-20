namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class AddressRequest
    {
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? PostalCode { get; set; }

        public int? CountryId { get; set; }
        public int? StateId { get; set; }
        public int? CityId { get; set; }
    }
}
