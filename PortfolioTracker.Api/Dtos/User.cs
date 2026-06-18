public class User
{
    public int Id {get;set;}

    public string Login {get;set;} = string.Empty;

    public string PasswordHash {get;set;} = string.Empty;
    public string FullName  {get;set;} = string.Empty;
    public DateTime CreatedAt {get;set;} 
    
    public int RoleId {get;set;} 

    public Role Role {get;set;}
}