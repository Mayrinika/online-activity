interface ChangeEventHandler<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

export const load = (evt: ChangeEventHandler<HTMLInputElement>, callback: (url:string) => void): void => {
    const width = 50;
    const height = 50;
    const files = (evt.target as HTMLInputElement).files;
    let file;
    if (files && files.length) {
        file = files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const url = elem.toDataURL();
                callback(url);
            };
            reader.onerror = error => console.log(error);
        };
    }
};

export function generate(name: string): string {
    const color = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
    const width = 50;
    const height = 50;
    const elem = document.createElement('canvas');
    elem.width = width;
    elem.height = height;
    const ctx = elem.getContext('2d');
    if (ctx) {
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = '#fff'
        ctx.font = "48px serif";
        ctx.fillText(name[0].toUpperCase(), 10, 40);

    }
    const url = elem.toDataURL();
    return url;
}
