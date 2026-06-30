using FluentValidation;

public class BuyAssetValidator : AbstractValidator<BuyAssetDto>
{
    public BuyAssetValidator()
    {
        RuleFor(x => x.AssetId)
        .GreaterThan(0);
        RuleFor(x => x.Quantity)
        .GreaterThan(0);
        RuleFor(x => x.Price)
        .GreaterThan(0);
    }
}