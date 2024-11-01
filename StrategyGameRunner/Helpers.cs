using Shared;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreRunner
{
    static class Helpers
    {
        public static int Distance(Location a, Location b)
        {
            ArgumentNullException.ThrowIfNull(a, nameof(a));
            ArgumentNullException.ThrowIfNull(b, nameof(b));
            return Convert.ToInt32(Math.Ceiling(Math.Sqrt(Math.Pow(a.y - b.y, 2) + Math.Pow(a.x - b.x, 2))));
        }

        public static int TotalDistance(this Location a, Location b)
        {
            return Math.Abs(a.x - b.x) + Math.Abs(a.y - b.y);
        }
    }
}
