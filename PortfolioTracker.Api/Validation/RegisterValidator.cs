using FluentValidation;

public class RegisterValidator : AbstractValidator<RegisterDto>
{
    public RegisterValidator()
    {
        RuleFor(x => x.Login)
        .NotEmpty().WithMessage("Login is required")
        .MinimumLength(4).WithMessage("Login must be at least 4 characters");

        RuleFor(x => x.Password)
        .NotEmpty().WithMessage("Password is required")
        .MinimumLength(8).WithMessage("Password must be at least 8 characters");

        RuleFor(x => x.FullName)
        .NotEmpty().WithMessage("FullName is required");
    }
}