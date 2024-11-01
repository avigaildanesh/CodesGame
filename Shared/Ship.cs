namespace Shared
{
    public class Ship : MapObject
    {
        public int TurnsToLive { get; set; }
        public int Power { get; set; } = 1;
        public int Speed { get; set; } = 1;
        public int CaptureSpeed { get; set; } = 1;
        public int AttackRange { get; set; } = 5;
        public bool CanMove { get; set; } = true;
        public Location Spawn { get; private set; }

        public override string ToString()
        {
            var s = $"[Ship {EntityID}, {Location}";
            if (TurnsToLive > 0)
            {
                s += $", Revives in {TurnsToLive}]";
            }
            else
            {
                s += "]";
            }
            return s;
        }

        public Ship()
        {

        }
        public Ship(Location loc, string id) : base(loc, id, MapItem.Ship)
        {
            this.Spawn = loc;
        }

    }
}
