using System.Security.Cryptography;
using System.Text;

namespace GameWebServer.Utilities
{
    public static class Hash
    {
        public static string Sha512(string input)
        {
            var inputBytes = Encoding.UTF8.GetBytes(input);
            var inputHash = SHA512.HashData(inputBytes);
            return Convert.ToHexString(inputHash);
        }
    }
}
