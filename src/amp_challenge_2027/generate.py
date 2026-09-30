"""Entry point for `uv run generate`.

The model code lives in three source roots that are not installable packages:
`src/LOGolas` (imported flat, e.g. `from logolasmap import ...`), `src/CPL-Diff`
(whose hyphen cannot appear in a module name), and `src/apple`. Rather than
restructuring them, this shim puts each root on sys.path and delegates to the
real generator in src/LOGolas/generate.py.
"""

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGOLAS_DIR = ROOT / "src" / "LOGolas"

SOURCE_ROOTS = (
    LOGOLAS_DIR,
    ROOT / "src" / "CPL-Diff",
    ROOT / "src",
)


def _load_generator():
    for root in SOURCE_ROOTS:
        path = str(root)
        if path not in sys.path:
            sys.path.insert(0, path)

    target = LOGOLAS_DIR / "generate.py"
    if not target.exists():
        raise FileNotFoundError(f"generator not found at {target}")

    spec = importlib.util.spec_from_file_location("logolas_generate", target)
    module = importlib.util.module_from_spec(spec)
    sys.modules["logolas_generate"] = module
    spec.loader.exec_module(module)
    return module


def main():
    _load_generator().main()


if __name__ == "__main__":
    main()
