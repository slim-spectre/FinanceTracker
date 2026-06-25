using FluentValidation;

public class LoginValidator : AbstractValidator<LoginDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.Login)
        .NotEmpty().WithMessage("Login cannot be empty");

        RuleFor(x => x.Password)
        .NotEmpty().WithMessage("Password cannot be empty");
    }
}