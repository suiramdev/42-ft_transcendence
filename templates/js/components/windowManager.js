export class WindowManager {
	constructor() {
	  this.windows = [];
	}

	openWindow(title, content) {
		console.log("✅ Ouverture de la fenêtre :", title);  // Debug
		const windowDiv = document.createElement('div');
		windowDiv.classList.add('window');

	windowDiv.innerHTML = `
		<div class="window-header">
		<h3>${title}</h3>
		<button class="close-button">X</button>
		</div>
		<div class="window-content">${content}</div>
	  `;

	  document.body.appendChild(windowDiv);
	  this.windows.push(windowDiv);

	  // Gérer le bouton fermer
	  windowDiv.querySelector('.close-button').addEventListener('click', () => {
		windowDiv.remove();
		this.windows = this.windows.filter(win => win !== windowDiv);
	  });

	  this.makeDraggable(windowDiv);
	}

	makeDraggable(windowElement) {
	  const header = windowElement.querySelector('.window-header');
	  let offsetX, offsetY, isDragging = false;

	  header.addEventListener('mousedown', (e) => {
		isDragging = true;
		offsetX = e.clientX - windowElement.offsetLeft;
		offsetY = e.clientY - windowElement.offsetTop;
	  });

	  document.addEventListener('mousemove', (e) => {
		if (isDragging) {
		  windowElement.style.left = `${e.clientX - offsetX}px`;
		  windowElement.style.top = `${e.clientY - offsetY}px`;
		}
	  });

	  document.addEventListener('mouseup', () => {
		isDragging = false;
	  });
	}
  }

  export const windowManager = new WindowManager();
