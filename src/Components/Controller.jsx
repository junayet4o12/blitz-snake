import { BiSolidDownArrow, BiSolidLeftArrow, BiSolidRightArrow, BiSolidUpArrow, BiUpArrow } from "react-icons/bi";
const Controller = () => {
    const handleButtonClick = (key) => {
        const keyCode = getKeyCode(key);
        if (keyCode) {
            const event = new KeyboardEvent('keydown', {
                key,
                code: key,
                keyCode,
                charCode: keyCode,
                which: keyCode,
                bubbles: true,
            });
            document.dispatchEvent(event);
        }
    };

    const getKeyCode = (key) => {
        if (key === 'ArrowUp') {
            return 38;
        } else if (key === 'ArrowDown') {
            return 40;
        } else if (key === 'ArrowLeft') {
            return 37;
        } else if (key === 'ArrowRight') {
            return 39;
        } else {
            return null;
        }
    };
    const controllerButtonStyle = 'px-4 py-2 bg-gray-700 text-white rounded w-12 mx-auto'
    return (
        < div className="grid grid-cols-1 gap-3 mt-4" >
            <button onClick={() => handleButtonClick('ArrowUp')} className={`${controllerButtonStyle}`}><BiSolidUpArrow /></button>
            <div className='flex gap-3'>
                <button onClick={() => handleButtonClick('ArrowLeft')} className={`${controllerButtonStyle}`}><BiSolidLeftArrow /></button>
                <button onClick={() => handleButtonClick('ArrowDown')} className={`${controllerButtonStyle}`}><BiSolidDownArrow /></button>
                <button onClick={() => handleButtonClick('ArrowRight')} className={`${controllerButtonStyle}`}><BiSolidRightArrow /></button>
            </div>

        </div >
    );
};

export default Controller;