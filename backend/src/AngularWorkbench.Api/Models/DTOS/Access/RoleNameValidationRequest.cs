namespace AngularWorkbench.Api.Models.DTOS.Access;

public sealed class RoleNameValidationRequest
{
    public required string Name { get; set; }
    public int? RoleId { get; set; }
}
