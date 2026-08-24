namespace AngularWorkbench.Api.Models.DTOS.Access;

public sealed class ValidationResultDto
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
}
