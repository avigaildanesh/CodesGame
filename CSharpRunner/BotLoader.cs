using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.CSharp.RuntimeBinder;
using Shared;
using System.Dynamic;
using System.Reflection;
using System.Text;

namespace CSharpRunner
{

    [Serializable]
    public class ClassNotFoundException : Exception
    {
        public ClassNotFoundException() { }
        public ClassNotFoundException(string message) : base(message) { }
        public ClassNotFoundException(string message, Exception inner) : base(message, inner) { }
        protected ClassNotFoundException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }

    internal class BotLoader<T> where T : class
    {
        public static T FromFile(string file)
        {
            Assembly assembly;
            if (File.Exists(file))
            {
                assembly = CompileCodeInMemory(file);
            }
            else if (Directory.Exists(file))
            {
                throw new NotImplementedException();
                //var files = Directory.GetFiles(file, "*.cs");
                //assembly = CompileCodeInMemory(files);
            }
            else
            {
                throw new FileNotFoundException(file);
            }


            var botType = assembly.GetTypes().FirstOrDefault(x => x.GetInterfaces().Contains(typeof(T)));
            if (botType == null)
            {
                throw new ClassNotFoundException($"Could not find a {typeof(T).Name} class in {file}");
            }
            return (T)assembly.CreateInstance(botType.FullName!)!;

        }

        public static Assembly CompileCodeInMemory(string file)
        {
            string code = File.ReadAllText(file);
            var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies();
            List<MetadataReference> references = [
                //MetadataReference.CreateFromFile(typeof(object).Assembly.Location), //mscorlib
                //MetadataReference.CreateFromFile(typeof(System.Collections.ArrayList).Assembly.Location),
                //MetadataReference.CreateFromFile(typeof(System.Collections.Generic.CollectionExtensions).Assembly.Location),
                //MetadataReference.CreateFromFile(typeof(Enumerable).Assembly.Location), //System.Linq
                //MetadataReference.CreateFromFile(typeof(Island).Assembly.Location)
                ];
            foreach(var  assembly in loadedAssemblies)
            {
                references.Add(MetadataReference.CreateFromFile(assembly.Location));
            }


            var comp = CSharpCompilation.Create(
                assemblyName: Path.GetRandomFileName(),
                syntaxTrees: new[] { CSharpSyntaxTree.ParseText(code) },
                references: references,
                options: new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
            );

            using var ms = new MemoryStream();
            var result = comp.Emit(ms);
            if (!result.Success)
            {
                // Handle compilation errors
                var failures = result.Diagnostics.Where(diagnostic =>
                    diagnostic.IsWarningAsError ||
                    diagnostic.Severity == DiagnosticSeverity.Error);

                StringBuilder sb = new();

                foreach (var diagnostic in failures)
                {
                    sb.AppendLine(diagnostic.GetMessage());
                }

                throw new InvalidOperationException(sb.ToString());
            }
            return Assembly.Load(ms.ToArray());
        }

        //public static Assembly CompileCodeInMemory(string[] codeFilePaths)
        //{
        //    ScriptOptions options = ScriptOptions.Default
        //        .WithReferences(typeof(T).Assembly)
        //        .WithImports("System");
        //    var script = CSharpScript.Create("", options);

        //    foreach (string codeFilePath in codeFilePaths)
        //    {
        //        string code = File.ReadAllText(codeFilePath);
        //        script = script.ContinueWith(code);
        //    }

        //    // Compile the script
        //    var compilation = script.GetCompilation();

        //    // Emit the compiled assembly
        //    using var ms = new MemoryStream();
        //    var result = compilation.Emit(ms);
        //    if (!result.Success)
        //    {
        //        // Handle compilation errors
        //        var failures = result.Diagnostics.Where(diagnostic =>
        //            diagnostic.IsWarningAsError ||
        //            diagnostic.Severity == DiagnosticSeverity.Error);

        //        StringBuilder sb = new();

        //        foreach (var diagnostic in failures)
        //        {
        //            sb.AppendLine(diagnostic.GetMessage());
        //        }

        //        throw new InvalidOperationException(sb.ToString());
        //    }

        //    return Assembly.Load(ms.ToArray());
        //}
    }
}
