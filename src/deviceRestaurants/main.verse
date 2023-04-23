using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

Model := struct {
    PotentialStock: float = 50000.0
    RegularAStock: float = 0.0
    RegularBStock: float = 0.0
    LoyalAStock: float = 0.0
    LoyalBStock: float = 0.0
    ProfitAStock: float = 0.0
    ProfitBStock: float = 0.0
}



## Library

Integral(y: float, flow: float, step: float): float =
    k1: float := step * flow
    k2: float := step * flow
    k3: float := step * flow
    k4: float := step * flow
    y + ((1.0 / 6.0) * (k1 + (2 * k2) + (2 * k3) + k4))



## Parameters

AdAParameter: float = 0.002

AdBParameter: float = 0.002

PriceA: float = 5.0

PriceB: float = 5.0

StoresA: float = 1.0

StoresB: float = 1.0



## Constants

PrimeCostFraction: float = 0.3

SingleStoreVisitors: float = 1000.0

LoyalGainFraction: float = 0.001

SingleRentCost: float = 3600.0

ChooseLossFraction: float = 0.5

SingleStoreCost: float = 50000.0

RatingLookup: []tuple(float, float) = array{(0.5, 10.0), (0.6, 6.0), (1.0, 5.0), (1.5, 4.0), (2.0, 1.0)}



## Flows

AdAFlow(foo: Model): float = AdAParameter * foo.PotentialStock

AdBFlow(foo: Model): float = AdBParameter * foo.PotentialStock

CapacityLossAFlow(foo: Model): float =
    Foo := foo.RegularAStock + foo.LoyalAStock
    Bar := TargetVisitorsA()
    if (Foo > Bar):
        Baz := ChooseAFlow(foo)
        if (Baz > 0.0):
            AdAFlow(foo) + ChooseAFlow(foo)
        else:
            AdAFlow(foo)
    else:
        0.0

CapacityLossBFlow(foo: Model): float =
    Foo := foo.RegularBStock + foo.LoyalBStock
    Bar := TargetVisitorsB()
    if (Foo > Bar):
        Baz := ChooseBFlow(foo)
        if (Baz > 0.0):
            AdBFlow(foo) + ChooseBFlow(foo)
        else:
            AdBFlow(foo)
    else:
        0.0

ChooseAFlow(foo: Model): float =
    RelativeRatingA := RatingA() / (RatingA() + RatingB())
    RegularSum := foo.RegularAStock + foo.RegularBStock
    (((RelativeRatingA * RegularSum) - foo.RegularAStock) * ChooseLossFraction)

ChooseBFlow(foo: Model): float =
    RelativeRatingB := RatingB() / (RatingA() + RatingB())
    RegularSum := foo.RegularAStock + foo.RegularBStock
    (((RelativeRatingB * RegularSum) - foo.RegularBStock) * ChooseLossFraction)

LoyalGainAFlow(foo: Model): float =
   foo.RegularAStock * LoyalGainFraction

LoyalGainBFlow(foo: Model): float =
   foo.RegularBStock * LoyalGainFraction

RevenueAFlow(foo: Model): float =
    (foo.RegularAStock + foo.LoyalAStock) * MarginPerPersonA()

RevenueBFlow(foo: Model): float =
    (foo.RegularBStock + foo.LoyalBStock) * MarginPerPersonB()

CostsAFlow(foo: Model): float =
    AdCostA(foo) + RentCostA()

CostsBFlow(foo: Model): float =
    AdCostB(foo) + RentCostB()



## Flow sums

PotentialFlowSum(foo: Model): float =  -(AdAFlow(foo)) + -(AdBFlow(foo)) + (CapacityLossAFlow(foo)) + (CapacityLossBFlow(foo))

RegularAFlowSum(foo: Model): float  = (AdAFlow(foo)) + (ChooseAFlow(foo)) + -(LoyalGainAFlow(foo)) + -(CapacityLossAFlow(foo))

RegularBFlowSum(foo: Model): float  = AdBFlow(foo) + ChooseBFlow(foo) + -(LoyalGainBFlow(foo)) + -(CapacityLossBFlow(foo))

LoyalAFlowSum(foo: Model): float    = LoyalGainAFlow(foo)

LoyalBFlowSum(foo: Model): float    = LoyalGainBFlow(foo)

ProfitAFlowSum(foo: Model): float   = RevenueAFlow(foo) + -(CostsAFlow(foo))

ProfitBFlowSum(foo: Model): float   = RevenueBFlow(foo) + -(CostsBFlow(foo))



## Variables

MarginPerPersonA(): float =
    PrimeCostA := PriceA * PrimeCostFraction
    PriceA - PrimeCostA

MarginPerPersonB(): float =
    PrimeCostB := PriceB * PrimeCostFraction
    PriceB - PrimeCostB

TargetVisitorsA(): float =
    StoresA * SingleStoreVisitors

TargetVisitorsB(): float =
    StoresB * SingleStoreVisitors

AdCostA(foo: Model): float =
    SingleAdCostA := PriceA / 2.0
    AdAFlow(foo) * SingleAdCostA

AdCostB(foo: Model): float =
    SingleAdCostB := PriceB / 2.0
    AdBFlow(foo) * SingleAdCostB

RentCostA(): float =
    StoresA * SingleRentCost

RentCostB(): float =
    StoresB * SingleRentCost

RatingA(): float =
    RelativePriceA := PriceA / PriceB
    # TODO: add interpolation from lookup table
    #lookup(RatingLookup, RelativePriceA)
    5.0

RatingB(): float =
    RelativePriceB := PriceB / PriceA
    # TODO: add interpolation from lookup table
    #lookup(RatingLookup, RelativePriceB)
    5.0



## Main

Tick(foo: Model): Model =
    Model{
        PotentialStock := Integral(foo.PotentialStock, PotentialFlowSum(foo), 0.1)
        RegularAStock := Integral(foo.RegularAStock,  RegularAFlowSum(foo), 0.1)
        RegularBStock := Integral(foo.RegularBStock,  RegularBFlowSum(foo), 0.1)
        LoyalAStock := Integral(foo.LoyalAStock,    LoyalAFlowSum(foo),   0.1)
        LoyalBStock := Integral(foo.LoyalBStock,    LoyalBFlowSum(foo),   0.1)
        ProfitAStock := Integral(foo.ProfitAStock,   ProfitAFlowSum(foo),  0.1)
        ProfitBStock := Integral(foo.ProfitBStock,   ProfitBFlowSum(foo),  0.1)
    }

hello_world_device := class(creative_device):
    OnBegin<override>()<suspends>:void=
        Print("Hello, world!")

        var counter : int = 0
        var a : int = 1
        var b : int = 1

        var foo: Model := Model{}

        loop:
             Sleep(1.0)
             set counter += 1

             set foo = Tick(foo)

             Print("Tick:{counter}, Potential clients:{foo.PotentialStock}")
             Print("A regular:{foo.RegularAStock}, loyal:{foo.LoyalAStock}, profit:{foo.ProfitAStock}")
             Print("B regular:{foo.RegularBStock}, loyal:{foo.LoyalBStock}, profit:{foo.ProfitBStock}")

             sum := a + b
             Print("mātrāmeru {sum}")
             set a = b
             set b = sum

             if (counter = 50):
                 break
