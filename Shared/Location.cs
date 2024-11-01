namespace Shared
{
    public class Location(int x, int y)
    {
        public int x { get; set; } = x;
        public int y { get; set; } = y;

        public int Distance(Location other)
        {
            ArgumentNullException.ThrowIfNull(other, nameof(other));
            return Math.Abs(y - other.y) + Math.Abs(x - other.x);
        }

        public bool IsSameLocation(Location other)
        {
            return other.x == x && other.y == y;
        }

        public override bool Equals(object? obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj is not Location loc) return false;

            return IsSameLocation(loc);
        }

        public override int GetHashCode()
        {
            int result = x;
            result = 31 * result + y;
            return result;
        }

        public override string ToString()
        {
            return $"({x}, {y})";
        }
    }
}
