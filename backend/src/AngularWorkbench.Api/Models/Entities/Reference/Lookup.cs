namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Lookup
{
    public int LookupId { get; set; }
    public int LookupCategoryId { get; set; }
    public int? ParentLookupId { get; set; }
    public int Value { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public LookupCategory LookupCategory { get; set; } = null!;
    public Lookup? ParentLookup { get; set; }
    public ICollection<Lookup> Children { get; set; } = new List<Lookup>();
    public ICollection<Role> CompanyScopeRoles { get; set; } = new List<Role>();
    public ICollection<AppUserRole> AccessScopeUserRoles { get; set; } = new List<AppUserRole>();

}
