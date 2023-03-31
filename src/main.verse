#using { /Verse.org }
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

MaxHealthUpgrade : int = 10

Foo():int =
     10

#Identifier(parameter1 : int, parameter2 : int) : int =
 #   var MaxHealthUpgrade : int = 10
  #  set MaxHealthUpgrade

NumberArray : []int = array{1, 2}

#MyArray : []int = for(Number := NumberArray, Number < 5):
 #   Number

# A Verse-authored creative device that can be placed in a level
hello_world_device := class(creative_device):

    # Runs when the device is started in a running game
    OnBegin<override>()<suspends>:void=
        # TODO: Replace this with your code
        Print("Hello, world!")
        Print("2 + 2 = {2 + 2}")
