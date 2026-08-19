namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Address
{
    public int AddressId { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? PostalCode { get; set; }

    public int? CountryId { get; set; }
    public int? StateId { get; set; }
    public int? CityId { get; set; }

    public Country? Country { get; set; }
    public State? State { get; set; }
    public City? City { get; set; }
    public Location? Location { get; set; }

}
public sealed class Country
{
    public int CountryId { get; set; }

    public required string Name { get; set; }

    // e.g. US
    public required string Code { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<State> States { get; set; }
        = new List<State>();
}
public sealed class State
{
    public int StateId { get; set; }

    public int CountryId { get; set; }

    public required string Name { get; set; }

    // e.g. TX
    public required string Code { get; set; }

    public bool IsActive { get; set; } = true;

    public Country Country { get; set; } = null!;

    public ICollection<City> Cities { get; set; }
        = new List<City>();
}
public sealed class City
{
    public int CityId { get; set; }

    public int StateId { get; set; }

    public required string Name { get; set; }

    public string? Code { get; set; }

    public bool IsActive { get; set; } = true;

    public State State { get; set; } = null!;
}
