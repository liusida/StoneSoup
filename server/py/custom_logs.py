import logging
from colorama import Fore, Style

class ColorFormatter(logging.Formatter):
    def format(self, record):
        # Prepend [ComfyUI] to the log message
        if record.name == 'root':
            # Since I don't want to modify ComfyUI's logging behavior (`logging.info`), make sure we don't use `root` and leave it to ComfyUI
            record.msg = f"{Fore.BLUE}{Style.DIM}[ComfyUI]\t{record.msg}{Style.RESET_ALL}"
        elif record.name == 'server':
            record.msg = f"{Fore.GREEN}{Style.NORMAL}[StoneSoup]\t{record.msg}{Style.RESET_ALL}"
        return super().format(record)

# Configure logging
formatter = ColorFormatter('%(levelname)s:\t%(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.basicConfig(level=logging.INFO, handlers=[handler])
