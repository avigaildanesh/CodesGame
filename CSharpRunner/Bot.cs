using Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSharpRunner
{
    public class Bot<T>(T botBase, string num) where T : IGameBot
    {
        private readonly T BotBase = botBase;
        internal string botNum = num;

        /// <returns>true if the turn counted, false otherwise</returns>
        public bool DoTurn(IGame game, int MAX_TIME = 200)
        {
            try
            {
                var task = Task.Factory.StartNew(() => BotBase.DoTurn(game));
                return task.Wait(TimeSpan.FromMilliseconds(MAX_TIME));
            }
            catch (AggregateException ae)
            {
                throw new Exception($"{ae.InnerExceptions[0].Message}");
            }
        }
    }
}
