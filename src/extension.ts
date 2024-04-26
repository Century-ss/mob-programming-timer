import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  let isInProgress: boolean = false
  let isBreakTime: boolean = false

  const startButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  startButton.command = 'mob-programming-timer.start'
  startButton.text = 'モブプロを始める'
  context.subscriptions.push(startButton)
  startButton.show()

  const stopButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  stopButton.command = 'mob-programming-timer.stop'
  stopButton.text = 'モブプロを終了'
  context.subscriptions.push(stopButton)

  const startDisposable = vscode.commands.registerCommand(
    'mob-programming-timer.start',
    async () => {
      isInProgress = true

      const numberOfPeople = await vscode.window.showInputBox({
        title: '何人でやりますか?(半角)',
      })
      const IntervalTime = await vscode.window.showInputBox({
        title: '何分ごとに交代しますか(半角)?',
      })
      // const breakTime = await vscode.window.showInputBox({
      //   title: "1ごとに何分の休憩を入れますか?",
      // });
      if (IntervalTime === undefined || numberOfPeople === undefined) {
        vscode.window.showInformationMessage('人数と時間を設定してください')
        return
      }

      // let minute: number = parseInt(IntervalTime);
      // let second: number = 0;
      // TODO: 一旦、デバッグしやすいように秒数にしているが、後で分に変更する
      let minute: number = 0
      let second: number = parseInt(IntervalTime)

      startButton.text = getDisplayTime(minute, second)
      stopButton.show()

      const intervalId = setInterval(() => {
        if (!isInProgress) {
          clearInterval(intervalId)
          isBreakTime = false
          return
        }

        if (second === 0) {
          second = 60
          minute = minute - 1
        } else {
          second = second - 1
        }

        if (minute === 0 && second === 0 && !isBreakTime) {
          vscode.window.showInformationMessage('交代です 5秒後にタイマーを始めます')
          isBreakTime = true
          minute = 0
          second = 5
        }

        if (minute === 0 && second === 0 && isBreakTime) {
          // モブプロ再開
          isBreakTime = false
          // let minute: number = parseInt(IntervalTime);
          // let second: number = 0;
          // TODO: 一旦、デバッグしやすいように秒数にしているが、後で分に変更する
          minute = 0
          second = parseInt(IntervalTime)
        }

        startButton.text = getDisplayTime(minute, second)
      }, 1 * 1000)
    }
  )

  const stopDisposable = vscode.commands.registerCommand('mob-programming-timer.stop', () => {
    isInProgress = false
    console.log('stop')
    stopButton.hide()
    startButton.text = 'モブプロを始める'
  })

  context.subscriptions.push(startDisposable)
  context.subscriptions.push(stopDisposable)
}

const getDisplayTime = (minute: number, second: number): string => {
  return String(minute) + ':' + String(second).padStart(2, '0')
}

export function deactivate() {}
