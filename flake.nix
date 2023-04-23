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

        deviceEvenOdd = pkgs.mkYarnPackage rec {
          src = ./src/device_even_odd;

          name = (pkgs.lib.importJSON (src + "/package.json")).name;

          version = (pkgs.lib.importJSON (src + "/package.json")).version;

          buildPhase =
            "yarn run asc assembly/index.ts --target release --outFile build/${name}.wasm";

          installPhase = ''
            mkdir $out
            cp ./deps/${name}/build/${name}.wasm $out/
            cp ./deps/${name}/build/${name}.wasm.map $out/
          '';

          doDist = false;
        };

        overlayTickTock = pkgs.stdenv.mkDerivation {
          name = "overlayTickTock";

          src = ./src/overlay_tick_tock;

          buildPhase = "cp ${deviceEvenOdd}/* .";

          installPhase = "mkdir $out; cp * $out";
        };

        overlayTickTockScript =
          pkgs.writeShellScriptBin "overlay_tick_tock_script"
          "${pkgs.python3}/bin/python3 -m http.server --directory ${overlayTickTock}";
      in rec {
        packages = {
          inherit deviceEvenOdd overlayTickTock overlayTickTockScript;
        };

        defaultPackage = packages.overlayTickTock;

        defaultApp = {
          type = "app";
          program = "${overlayTickTockScript}/bin/overlay_tick_tock_script";
        };

        devShell =
          pkgs.mkShell { nativeBuildInputs = with pkgs; [ nodejs yarn ]; };
      });
}
