namespace Shared
{
    public class MapObject
    {
        public Location? Location { get; set; }
        public string? EntityID { get; set; }
        public MapItem MapItem { get; set; }

        public override string ToString()
        {
            return $"[{MapItem} {EntityID}, {Location}]";
        }

        public MapObject(Location loc, string id, MapItem item)
        {
            this.Location = loc;
            this.EntityID = id;
            this.MapItem = item;
        }

        public MapObject()
        {

        }
    }
}
