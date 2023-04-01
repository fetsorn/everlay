using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

hello_world_device := class(creative_device):
    OnBegin<override>()<suspends>:void=
        Print("Hello, world!")
        var counter : int = 0
        var a : int = 1
        var b : int = 1
        loop:
             set counter += 1
             sum := a + b
             Print("{sum}")
             set a = b
             set b = sum
             if (counter = 20):
                 break
