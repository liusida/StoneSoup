import logging
from colorama import Fore, Style
class ColorFormatter(logging.Formatter):
    def format(self, record):
        if record.name == 'root':
            record.msg = f"{Fore.LIGHTBLUE_EX}{record.msg}{Style.RESET_ALL}"
        elif record.name == 'server':
            record.msg = f"{Fore.LIGHTGREEN_EX}{record.msg}{Style.RESET_ALL}"
        elif record.name.startswith('watchfiles'):
            record.msg = f"{Fore.LIGHTBLACK_EX}{record.msg}{Style.RESET_ALL}"
        return super().format(record)
# Configure logging
formatter = ColorFormatter('%(levelname)s:%(name)s:\t%(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.basicConfig(level=logging.INFO, handlers=[handler])
