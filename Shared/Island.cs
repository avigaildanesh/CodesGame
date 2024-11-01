namespace Shared
{
    public class Island : MapObject
    {
        public string? CapturingTeam { get; set; } = "0";
        public int CaptureRange { get; set; }
        public int TurnsToCapture { get; set; }
        public string? Owner { get; set; } = "0";


        public Island(): base()
        {

        }
        public Island(Location loc, string id, int turnsToCapture, string owner = "0", int captureRange = 5) : base(loc, id, MapItem.Island)
        {
            this.CaptureRange = captureRange;   
            this.TurnsToCapture = turnsToCapture;
            this.Owner = owner;

        }

        public override string ToString()
        {
            return $"[{MapItem} {EntityID}, owned by {Owner}{(CapturingTeam != Owner ? $", will get captured by {CapturingTeam} in {TurnsToCapture} turns" : "")}, {Location}]";
        }
    }
}
