mkdir -p ../chartHN_tmp
mv .env ../chartHN_tmp/ || echo "no .env"
# mv data ../chartHN_tmp/
rsync -auv --remove-source-files data/ ../chartHN_tmp/data/


git checkout data
git pull
git rm -r data || echo './data is clear'
# Move contents of data to the root, handling subdirectories correctly. -a preserves attributes
rsync -au ../chartHN_tmp/data/ ./
git add .
git commit -m "update $(date +%Y-%m-%d)" || echo "No changes to commit"
git push origin data || echo "No changes to push"
git checkout master