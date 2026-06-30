using FluentValidation;

public class SellAssetValidator : AbstractValidator<SellAssetDto>
{
    public SellAssetValidator()
    {
        RuleFor(x => x.AssetId)
        .GreaterThan(0);
        RuleFor(x => x.Quantity)
        .GreaterThan(0);
        RuleFor(x => x.Price)
        .GreaterThan(0);
    }
}