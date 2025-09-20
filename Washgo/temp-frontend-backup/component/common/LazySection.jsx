function LazySection({ isLoading, children, skeleton }) {
  return isLoading ? skeleton : children;
}
export default LazySection;
