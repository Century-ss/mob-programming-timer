import * as vscode from 'vscode'

let intervalId: NodeJS.Timeout

export function activate(context: vscode.ExtensionContext) {
  let intervalMinutes: number

  const startButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  startButton.command = 'mob-programming-timer.start'
  startButton.text = '🚀 Mob start'
  startButton.show()

  const remainingTimeBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)

  const restartButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  restartButton.command = 'mob-programming-timer.restart'
  restartButton.text = '🔄 Mob restart'

  const finishButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  finishButton.command = 'mob-programming-timer.finish'
  finishButton.text = '🏁 Mob finish'

  const startDisposable = vscode.commands.registerCommand(
    'mob-programming-timer.start',
    async () => {
      const inputIntervalTime = await vscode.window.showInputBox({
        title: 'How often do you change drivers in minutes?',
      })

      intervalMinutes = validateInputIntervalTime(inputIntervalTime)

      startMobTimer({
        intervalMinutes: intervalMinutes,
        remainingTimeBar: remainingTimeBar,
      })

      startButton.hide()
      restartButton.show()
      finishButton.show()
    },
  )

  const restartDisposable = vscode.commands.registerCommand('mob-programming-timer.restart', () => {
    clearInterval(intervalId)
    startMobTimer({
      intervalMinutes: intervalMinutes,
      remainingTimeBar: remainingTimeBar,
    })
  })

  const notifyTimeUpDisposable = vscode.commands.registerCommand(
    'mob-programming-timer.notifyTimeUp',
    () => {
      clearInterval(intervalId)

      vscode.window
        .showInformationMessage("👨‍💻🔄👩‍💻 It's time to switch.", 'Restart next mob', 'Finish mob')
        .then((value) => {
          if (value === 'Restart next mob') {
            vscode.commands.executeCommand('mob-programming-timer.restart')
          } else if (value === 'Finish mob') {
            vscode.commands.executeCommand('mob-programming-timer.finish')
          } else {
            // If the user closes the dialog, value become undefined and do nothing.
          }
        })
    },
  )

  const finishDisposable = vscode.commands.registerCommand('mob-programming-timer.finish', () => {
    clearInterval(intervalId)

    remainingTimeBar.hide()
    finishButton.hide()
    restartButton.hide()
    startButton.show()
  })

  context.subscriptions.push(startButton)
  context.subscriptions.push(restartButton)
  context.subscriptions.push(finishButton)
  context.subscriptions.push(startDisposable)
  context.subscriptions.push(restartDisposable)
  context.subscriptions.push(finishDisposable)
  context.subscriptions.push(notifyTimeUpDisposable)
}

export function deactivate() {}

const getDisplayTime = (minute: number, second: number): string => {
  return `⏳ ${String(minute)}:${String(second).padStart(2, '0')}`
}

const zenkakuToHankaku = (word: string): string => {
  return word.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s: string) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  )
}

export const validateInputIntervalTime = (inputIntervalTime: string | undefined): number => {
  if (inputIntervalTime === undefined) {
    throw new Error('Please set the rotation time.')
  }
  if (Number.isNaN(Number.parseInt(zenkakuToHankaku(inputIntervalTime)))) {
    throw new Error('Please enter an integer.')
  }
  if (Number.parseInt(zenkakuToHankaku(inputIntervalTime)) === 0) {
    throw new Error('Please enter an integer greater than zero.')
  }
  return Number.parseInt(zenkakuToHankaku(inputIntervalTime))
}

type startMobTimerArgs = {
  intervalMinutes: number
  remainingTimeBar: vscode.StatusBarItem
}

export const startMobTimer = ({ intervalMinutes, remainingTimeBar }: startMobTimerArgs): void => {
  let minute = intervalMinutes
  let second = 0

  remainingTimeBar.text = getDisplayTime(minute, second)
  remainingTimeBar.show()

  intervalId = setInterval(() => {
    if (minute === 0 && second === 0) {
      vscode.commands.executeCommand('mob-programming-timer.notifyTimeUp')
      return
    }

    if (second === 0) {
      second = 59
      minute = minute - 1
    } else {
      second = second - 1
    }

    remainingTimeBar.text = getDisplayTime(minute, second)
  }, 1 * 1000)
}
