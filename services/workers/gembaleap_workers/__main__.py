import sys

from .jobs import JOBS


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in JOBS:
        sys.exit(f"usage: python -m gembaleap_workers {{{','.join(JOBS)}}}")
    JOBS[sys.argv[1]]()


if __name__ == "__main__":
    main()
