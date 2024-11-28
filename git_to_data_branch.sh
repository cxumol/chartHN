mkdir -p ../chartHN_tmp
mv .env ../chartHN_tmp/ || echo "no .env"
# mv data ../chartHN_tmp/
rsync -av data/ ../chartHN_tmp/data/


git checkout data
git rm -r --cached .
# Move contents of data to the root, handling subdirectories correctly. -a preserves attributes
rsync -au ../chartHN_tmp/data/ ./
git add .
git commit -m "update $(date +%Y-%m-%d)"
git push