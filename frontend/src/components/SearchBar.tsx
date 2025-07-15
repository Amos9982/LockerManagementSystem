type Props = { value: string; onChange: (v: string) => void };

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search-bar">
        <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    />
</div>
  );
}
