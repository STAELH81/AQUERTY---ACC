// script.js

const terminal = document.getElementById('terminal');
let isAuthenticated = false;
let promptActive = false;
const commandHistory = [];
const fileList = [
  "assets/message_secret.txt",
  "assets/ACC Manual.pdf",
  "assets/intro_video.mp4",
  "assets/schema_X.img"
];

let sessionId = null;
let accessLevel = 0;

const asciiLogo = `
    █████╗  ██████╗ ██╗   ██╗███████╗██████╗ ████████╗██╗   ██╗
   ██╔══██╗██╔═══██╗██║   ██║██╔════╝██╔══██╗╚══██╔══╝╚██╗ ██╔╝
   ███████║██║   ██║██║   ██║█████╗  ██████╔╝   ██║    ╚████╔╝ 
   ██╔══██║██║  ███║██║   ██║██╔══╝  ██ ██╔╝    ██║     ╚██╔╝  
   ██║  ██║╚████████╚██████╔╝███████╗██║ ██║    ██║      ██║   
   ╚═╝  ╚═╝ ╚══════╝ ╚═════╝ ╚══════╝╚═╝ ╚═╝    ╚═╝      ╚═╝   

        A Q U E R T Y   I N D U S T R I E S
============================================================
`;

const introSequence = async () => {
  await print("[INIT] System initialization...");
  await print("[FW] Loading dynamic firewall rules");
  await print("[NET] Secure hub connection - Established");
  await print("[SEC] Encryption modules loading - OK");
  await print("Enter session ID:");
  await getSessionId();
};

const print = (text, delay = 30) => {
  return new Promise(resolve => {
    let i = 0;
    let line = '';
    const interval = setInterval(() => {
      line += text.charAt(i);
      terminal.innerHTML += text.charAt(i);
      terminal.scrollTop = terminal.scrollHeight;
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        terminal.innerHTML += "\n";
        resolve();
      }
    }, delay);
  });
};

const getSessionId = () => {
  const input = document.createElement('input');
  terminal.appendChild(input);
  input.focus();

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const id = input.value.trim();
      input.remove();
      sessionId = id;
      accessLevel = parseInt(id) <= 99 ? 3 : parseInt(id) <= 299 ? 2 : 1;
      print("Enter password:").then(getPassword);
    }
  });
};

const getPassword = () => {
  const input = document.createElement('input');
  terminal.appendChild(input);
  input.focus();

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const pwd = input.value.trim();
      input.remove();
      const expectedPwd =
        accessLevel === 3 ? 'rootadmin' :
        accessLevel === 2 ? `AQ-DEV-${sessionId}-dev` :
        `AQ-${sessionId}`;

      if (pwd === expectedPwd) {
        terminal.innerHTML += '\nAccess granted\n';
        terminal.innerHTML += asciiLogo + "\n";
        isAuthenticated = true;
        launchPrompt();
      } else {
        terminal.innerHTML += '\nAccess denied.\n';
        getPassword();
      }
    }
  });
};

const launchPrompt = () => {
  if (!promptActive) printPrompt();
};

const printPrompt = () => {
  promptActive = true;
  const input = document.createElement('input');
  terminal.innerHTML += '> ';
  terminal.appendChild(input);
  input.focus();

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      input.remove();
      handleCommand(cmd);
    }
  });
};

const handleCommand = (cmd) => {
  terminal.innerHTML += cmd + '\n';
  if (cmd) commandHistory.push(cmd);

  const requireLevel = (level) => {
    if (accessLevel < level) {
      terminal.innerHTML += '[SECURITY] Access denied.\n';
      printPrompt();
      return false;
    }
    return true;
  };

  if (cmd === 'help') {
    terminal.innerHTML += `Available commands:\nhelp, clear, shutdown, files, file_<name>, logs_<name>, whoami, sysinfo, trace, sudo, history, dir\n`;
  } else if (cmd === 'clear') {
    terminal.innerHTML = '';
  } else if (cmd === 'shutdown') {
    if (!requireLevel(1)) return;
    location.reload();
    return;
  } else if (cmd === 'files') {
    terminal.innerHTML += 'Available files:\n' + fileList.map(f => '- ' + f.split('/').pop()).join('\n') + '\n';
  } else if (cmd.startsWith('file_')) {
    const name = cmd.slice(5);
    const filename = fileList.find(f => f.includes(name));
    if (!filename) {
      terminal.innerHTML += '[ERROR] File not found\n';
    } else if (filename.endsWith('.txt')) {
      fetch(filename).then(r => r.text()).then(t => {
        terminal.innerHTML += `\n[TEXT] Content of ${filename} :\n------------------------\n${t}\n------------------------\n`;
        printPrompt();
      }).catch(() => {
        terminal.innerHTML += '\n[ERROR] Failed to read file.\n';
        printPrompt();
      });
      return;
    } else if (filename.endsWith('.pdf')) {
      terminal.innerHTML += `\n[PDF] Preview:<br><iframe src="${filename}" style="width:600px;height:400px;border:none;"></iframe>`;
    } else if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.img')) {
      terminal.innerHTML += `\n[IMAGE]<br><img src="${filename}" style="max-width:500px;">`;
    } else if (filename.endsWith('.mp4')) {
      terminal.innerHTML += `\n[VIDEO]<br><video src="${filename}" controls style="max-width:500px;"></video>`;
    }
  } else if (cmd.startsWith('logs_')) {
    if (!requireLevel(2)) return;
    const name = cmd.slice(5);
    terminal.innerHTML += `\n[LOGS] Redirecting to logs/${name}.html ...`;
    window.open(`logs/${name}.html`, '_blank');
  } else if (cmd === 'whoami') {
    const role = accessLevel === 3 ? 'Admin' : accessLevel === 2 ? 'Developer' : 'Guest';
    terminal.innerHTML += `Session: ${sessionId}\nRole: ${role}\nAccess Level: ${accessLevel}\n`;
  } else if (cmd === 'sysinfo') {
    if (!requireLevel(3)) return;
    terminal.innerHTML += '[SYS] Machine IBM PC XT - 640KB RAM - DOS v2.0 - Secure connection\n';
  } else if (cmd === 'trace') {
    if (!requireLevel(2)) return;
    terminal.innerHTML += '[TRACE] Running network trace...\nHop 1 -> 192.168.0.1\nHop 2 -> 10.10.0.254\nHop 3 -> aquerty.internal\nTrace complete.\n';
  } else if (cmd === 'sudo') {
    if (!requireLevel(3)) return;
    terminal.innerHTML += '[AUTH] Admin privileges verified. Root mode not available in demo.\n';
  } else if (cmd === 'history') {
    if (!requireLevel(2)) return;
    terminal.innerHTML += '[HISTORY]\n' + commandHistory.join('\n') + '\n';
  } else if (cmd === 'dir') {
    if (!requireLevel(2)) return;
    terminal.innerHTML += '[DIR] Listing current directory:\n' + fileList.map(f => f).join('\n') + '\n';
  } else {
    terminal.innerHTML += '[ERROR] Unknown command\n';
  }
  printPrompt();
};

window.onload = () => {
  introSequence();
};
