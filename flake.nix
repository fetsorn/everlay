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
        nodeVersion =
          builtins.elemAt (pkgs.lib.versions.splitVersion pkgs.nodejs.version)
          0;
        deviceEvenOdd = pkgs.mkYarnPackage rec {
          src = ./src/deviceEvenOdd;
          name = (pkgs.lib.importJSON (src + "/package.json")).name;
          version = (pkgs.lib.importJSON (src + "/package.json")).version;
          buildPhase = ''
            yarn run asc assembly/index.ts --target release --outFile build/${name}.wasm
          '';
          installPhase = ''
            mkdir $out
            cp ./deps/${name}/build/${name}.wasm $out/
            cp ./deps/${name}/build/${name}.wasm.map $out/
          '';
          doDist = false;
        };
        overlayTickTock = pkgs.stdenv.mkDerivation {
          name = "overlayTickTock";
          src = ./src/overlayTickTock;
          buildPhase = ''
            cp ${deviceEvenOdd}/* .
          '';
          installPhase = "mkdir $out; cp * $out";
        };
        overlayTickTockScript =
          pkgs.writeShellScriptBin "overlayTickTockScript" ''
            ${pkgs.python3}/bin/python3 -m http.server --directory ${overlayTickTock}
          '';
      in rec {
        packages = {
          inherit deviceEvenOdd overlayTickTock overlayTickTockScript;
        };
        defaultPackage = packages.overlayTickTock;
        defaultApp = {
          type = "app";
          program = "${overlayTickTockScript}/bin/overlayTickTockScript";
        };
        devShell =
          pkgs.mkShell { nativeBuildInputs = with pkgs; [ nodejs yarn ]; };
      });
}
