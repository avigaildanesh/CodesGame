using System.Collections.Generic;
namespace Shared
{
    public class Orders
    {
        public List<Order> OrdersList { get; set; }
        public List<Order> Errors { get; set; }
        public Orders()
        {
            OrdersList = [];
            Errors = [];
        }

    }
}
