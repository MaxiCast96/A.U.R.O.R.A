const InputField = ({ name, label, type = 'text', value, onChange, error }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cyan-500'
                }`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;