{
  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11"; };
  outputs = inputs@{ nixpkgs, ... }:
    let
      eachSystem = systems: f:
        let
          op = attrs: system:
            let
              ret = f system;
              op = attrs: key:
                let
                  appendSystem = key: system: ret: { ${system} = ret.${key}; };
                in attrs // {
                  ${key} = (attrs.${key} or { })
                    // (appendSystem key system ret);
                };
            in builtins.foldl' op attrs (builtins.attrNames ret);
        in builtins.foldl' op { } systems;
      defaultSystems = [ "x86_64-linux" "aarch64-darwin" ];
    in eachSystem defaultSystems (system:
      let
        pkgs = import nixpkgs { inherit system; };

        mkServeScript = drv:
          pkgs.writeShellScriptBin "serve"
          "${pkgs.python3}/bin/python3 -m http.server --directory ${drv}";

        deviceEvenOddDrv = async:
          pkgs.mkYarnPackage rec {
            src = ./src/device_even_odd;

            name = (pkgs.lib.importJSON (src + "/package.json")).name;

            version = (pkgs.lib.importJSON (src + "/package.json")).version;

            buildPhase =
              "yarn run asc assembly/index.ts --target release --outFile build/${name}.wasm"
              + " --path ./node_modules --use abort=assembly/index/abort"
              + (if async then
                " --optimize --optimizeLevel 3 --shrinkLevel 2 --importMemory --runPasses asyncify"
              else
                "");

            installPhase = ''
              mkdir $out
              cp ./deps/${name}/build/${name}.wasm $out/
              cp ./deps/${name}/build/${name}.wasm.map $out/
            '';

            doDist = false;
          };

        deviceEvenOdd = deviceEvenOddDrv false;

        deviceEvenOddAsync = deviceEvenOddDrv true;

        overlayTickTock = pkgs.stdenv.mkDerivation {
          name = "overlayTickTock";

          src = ./src/overlay_tick_tock;

          buildPhase = "cp ${deviceEvenOdd}/* .";

          installPhase = "mkdir $out; cp * $out";
        };

        overlayTickTockScript = mkServeScript overlayTickTock;

        overlayTickTockAsync = pkgs.stdenv.mkDerivation {
          name = "overlayTickTock";

          src = ./src/overlay_tick_tock_async;

          buildPhase = "cp ${deviceEvenOddAsync}/* .";

          installPhase = "mkdir $out; cp * $out";
        };

        overlayTickTockAsyncScript = mkServeScript overlayTickTockAsync;

        overlayMarket = pkgs.stdenv.mkDerivation {
          name = "overlayMarket";

          src = ./src/overlay_market;

          buildPhase = "cp ${deviceEvenOddAsync}/* .";

          installPhase = "mkdir $out; cp -r * $out";
        };

        overlayMarketScript = mkServeScript overlayMarket;
      in rec {
        packages = {
          inherit deviceEvenOdd deviceEvenOddAsync overlayTickTock
            overlayTickTockScript overlayTickTockAsync
            overlayTickTockAsyncScript overlayMarketScript;
        };

        defaultPackage = overlayMarket;

        defaultApp = {
          type = "app";
          program = "${overlayMarketScript}/bin/serve";
        };

        devShell =
          pkgs.mkShell { nativeBuildInputs = with pkgs; [ nodejs yarn ]; };
      });
}
