let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  buildInputs = [ 
    pkgs.deno
    pkgs.md4c
    pkgs.nodePackages.mermaid-cli
  ];
}
