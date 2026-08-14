namespace AngularWorkbench.Api.Tests;

public class BackendScaffoldTests
{
    [Fact]
    public void TestProjectReferencesApiAssembly()
    {
        Assert.Equal("AngularWorkbench.Api", typeof(Program).Assembly.GetName().Name);
    }
}
