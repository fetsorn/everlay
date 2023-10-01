import Data.Int
import Data.Bool
-- foreign import ccall unsafe "_malloc" malloc :: Int -> IO Int

-- not used
main = putStrLn "hello world"


-- fib :: Int -> Int
-- fib a = 0

-- __new :: Int -> IO Int
-- __new size = malloc(size)

isEven :: Bool
isEven = False

foreign export ccall isEven :: Bool
-- foreign export ccall fib :: Int -> Int
-- foreign export ccall __new :: Int -> IO Int
