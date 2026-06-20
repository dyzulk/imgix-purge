import * as p from '@clack/prompts';
import pc from 'picocolors';

export const ui = {
  intro: (title: string) => {
    p.intro(pc.bgCyan(pc.black(` ${title} `)));
  },
  outro: (message: string) => {
    p.outro(message);
  },
  log: {
    info: (msg: string) => p.log.info(msg),
    success: (msg: string) => p.log.success(pc.green(msg)),
    warn: (msg: string) => p.log.warn(pc.yellow(msg)),
    error: (msg: string) => p.log.error(pc.red(msg)),
    step: (msg: string) => p.log.step(msg),
    message: (msg: string) => p.log.message(msg),
  },
  text: p.text,
  confirm: p.confirm,
  select: p.select,
  password: p.password,
  spinner: p.spinner,
  note: p.note,
  isCancel: p.isCancel,
  cancel: (msg: string = 'Operation cancelled.') => {
    p.cancel(pc.yellow(msg));
  },
};
