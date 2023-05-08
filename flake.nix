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

          buildPhase = "yarn asbuild:release";

          installPhase = ''
            mkdir $out
            cp ./deps/${name}/build/release.wasm $out/
            cp ./deps/${name}/build/release.wasm.map $out/
          '';

          doDist = false;
        };

        deviceEvenOddAsync = pkgs.mkYarnPackage rec {
          src = ./src/device_even_odd_async;

          name = (pkgs.lib.importJSON (src + "/package.json")).name;

          version = (pkgs.lib.importJSON (src + "/package.json")).version;

          buildPhase = "yarn asbuild:release";

          installPhase = ''
            mkdir $out
            cp ./deps/${name}/build/release.wasm $out/
            cp ./deps/${name}/build/release.wasm.map $out/
          '';

          doDist = false;
        };

        deviceEvenOddMsgpack = pkgs.mkYarnPackage rec {
          src = ./src/device_even_odd_msgpack;

          name = (pkgs.lib.importJSON (src + "/package.json")).name;

          version = (pkgs.lib.importJSON (src + "/package.json")).version;

          buildPhase = "yarn build:release";

          installPhase = ''
            mkdir $out
            cp ./deps/${name}/build/release.wasm $out/
            cp ./deps/${name}/build/release.wasm.map $out/
          '';

          doDist = false;
        };

        app = pkgs.stdenv.mkDerivation {
          name = "everlay";

          src = ./src;

          buildPhase = ''
            mkdir -p device_even_odd/build
            cp ${deviceEvenOddAsync}/* device_even_odd/build/
            mkdir -p device_even_odd_async/build
            cp ${deviceEvenOddAsync}/* device_even_odd_async/build/
            mkdir -p device_even_odd_msgpack/build
            cp ${deviceEvenOddMsgpack}/* device_even_odd_msgpack/build/
          '';

          installPhase = "cp -r $PWD $out";
        };

        script = pkgs.writeShellScriptBin "serve"
          "${pkgs.python3}/bin/python3 -m http.server --directory ${app}";
      in rec {
        packages = {
          inherit deviceEvenOdd deviceEvenOddAsync deviceEvenOddMsgpack app
            script;
        };

        defaultPackage = app;

        defaultApp = {
          type = "app";
          program = "${script}/bin/serve";
        };

        devShell =
          pkgs.mkShell { nativeBuildInputs = with pkgs; [ nodejs yarn ]; };
      });
}
