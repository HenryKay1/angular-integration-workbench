namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Address
{
    public int AddressId { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? PostalCode { get; set; }
    public int? CountryLookupId { get; set; }
    public int? StateLookupId { get; set; }
    public int? CityLookupId { get; set; }

    public Lookup? Country { get; set; }
    public Lookup? State { get; set; }
    public Lookup? City { get; set; }
    public Location? Location { get; set; }
}
