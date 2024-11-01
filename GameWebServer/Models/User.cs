using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GameWebServer.Models
{
    [Index(nameof(Id), nameof(Username), IsUnique = true)]
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required, DataType(DataType.Text)]
        public required string Username { get; set; }
        [Required, DataType(DataType.Password), JsonIgnore]
        public string? Password { get; set; }
        public string? DisplayName { get; set; }
        public Role Role { get; set; }

        public ICollection<Friendship> Friends { get; set; }
        public ICollection<UserCode> UserCodes { get; set; }

        public int? SelectedCodeId { get; set; }
        public UserCode SelectedCode { get; set; }
    }
}
