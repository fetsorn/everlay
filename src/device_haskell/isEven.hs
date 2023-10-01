import Data.Int
import Data.Bool
foreign import ccall unsafe "num" num :: Int32
-- foreign import ccall unsafe "_malloc" malloc :: Int -> IO Int

-- not used
main = putStrLn ""


isEven :: Bool
isEven = if mod num 2 == 0 then True else False

foreign export ccall isEven :: Bool

-- __new :: Int -> IO Int
-- __new size = malloc(size)

-- foreign export ccall __new :: Int -> IO Int
